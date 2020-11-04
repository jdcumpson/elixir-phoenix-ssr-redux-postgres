defmodule QuickstartWeb.ManifestCache do
  use Agent

  def start_link(_ \\ []) do
    manifest = load_manifest()
    Agent.start_link(fn -> manifest end, name: __MODULE__)
  end

  def get(filters, ends_with) do
    Agent.get(__MODULE__, fn state -> state end)
    |> Enum.filter(fn {name, _} ->
      String.contains?(name, filters) and String.ends_with?(name, ends_with)
    end)
    |> Enum.reject(&is_gzip/1)
    |> Enum.reject(&is_source_map/1)
    |> Enum.map(fn {_name, path} -> path end)
  end

  defp is_gzip({key, _val}) do
    String.ends_with?(key, ".gz")
  end

  defp is_source_map({key, _val}) do
    String.ends_with?(key, ".map")
  end

  defp load_manifest do
    manifest_path = Application.get_env(:quickstart_web, :manifest_path)

    File.read!(manifest_path)
    |> Poison.decode!()
    |> Map.new()
  end
end
