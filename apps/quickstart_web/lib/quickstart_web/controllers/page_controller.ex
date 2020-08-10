defmodule QuickstartWeb.PageController do
  use QuickstartWeb, :controller
  require HTTPoison.Retry
  import HTTPoison.Retry

  @default_title "Quickstart"
  @default_description "Learn the ins and outs of SSR"

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, %{"path" => path_string} = params) do
    path = "/#{Enum.join(path_string, "/")}"

    # allow clients to force ssr rendering on
    ssr_on =
      Map.get(
        params,
        "ssr_on",
        Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)
        |> Keyword.get(:ssr_on)
      )

    case ssr_on do
      nil ->
        render(conn, "index.html")

      _ ->
        render(conn, "index.html")

        # assume any value provided other than nil is truthy
        [host: host, port: port] =
          Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)
          |> Keyword.get(:ssr_node_server)

        page_data = get_page_data(conn, path)

        [js, css, computed_state] =
          HTTPoison.post(
            "#{host}:#{port}#{path}",
            Jason.encode!(page_data)
          )
          |> autoretry(
            max_attempts: 20,
            wait: 3000,
            retry_unknown_errors: true
          )
          |> handle_response()

        render(conn, "index.html", %{
          js: js,
          css: css,
          initial_state: Jason.encode!(computed_state),
          title: Map.get(page_data, :title, @default_title),
          description: Map.get(page_data, :description, @default_description),
          # og_title: Map.get(page_data, :og_title, @default_og_title),
          og_type: Map.get(page_data, :og_type, ""),
          og_url: Map.get(page_data, :og_url, "")
          # og_image: Map.get(page_data, :og_image, @default_og_image)
        })
    end
  end

  defp handle_response({:ok, %HTTPoison.Response{body: body}}) do
    [_js, _css, _computed_state] = Jason.decode!(body)
  end

  defp get_page_data(conn, path) do
    %{
      actions: [
        # react_responsive_action(conn)
      ],
      state: %{}
    }
  end
end
