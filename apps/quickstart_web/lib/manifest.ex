defmodule QuickstartWeb.Manifest do
  use GenServer

  def start_link(_ \\ []) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  @spec init(any) :: {:ok, []}
  def init(_) do
    Process.send_after(self(), :poll_start, 0)
    {:ok, []}
  end

  defp load_manifests do
    app_names = Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)[:app_names]
    Enum.map(app_names, &load_manifest/1)
  end

  defp load_manifest(app_name) do
    [host: host, port: port, path: path, protocol: protocol] =
      Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)[:static_url]

    # in development it needs to hit the webpack dev server / middleware
    # in production the files need to be deployed behind nginx already
    # TODO: use a hash named folder to allow seemless front-end updates
    # such that the files aren't deleted when a new version is deployed
    url = "#{protocol}://#{host}:#{port}#{path}/#{app_name}/web/manifest.json"

    case HTTPoison.get(url, [], hackney: [insecure: true]) do
      {:ok, %HTTPoison.Response{body: body, status_code: 200}} ->
        {app_name, Poison.decode!(body) |> Map.new()}

      {:ok, %HTTPoison.Response{body: _, status_code: _}} ->
        {app_name, %{}}

      {:error, _reason} ->
        {app_name, %{}}
    end
  end

  def get_manifest(app_name) do
    GenServer.call(__MODULE__, {:get_manifest, app_name})
  end

  @impl true
  def handle_info(:poll_start, _state) do
    Process.send_after(self(), :poll_start, 1000)
    {:noreply, load_manifests()}
  end

  @impl true
  def handle_call({:get_manifest, name}, _, state) do
    name = if is_atom(name), do: name, else: String.to_atom(name)
    {:reply, Keyword.get(state, name), state}
  end
end
