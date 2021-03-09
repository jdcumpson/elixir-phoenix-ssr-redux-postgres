defmodule QuickstartWeb.PageController do
  use QuickstartWeb, :controller
  require HTTPoison.Retry
  import HTTPoison.Retry

  plug(:put_layout, {QuickstartWeb.LayoutView, "app.manifest.html"})

  @default_title "Quickstart"
  @default_description "Learn the ins and outs of SSR"

  def not_found(conn, _args) do
    send_resp(conn, 404, "")
  end

  def index(conn, %{"path" => path_string} = params) do
    path = "/#{Enum.join(path_string, "/")}"
    conn = put_layout(conn, {QuickstartWeb.LayoutView, "app.manifest.html"})

    # allow clients to force ssr rendering on
    ssr_on =
      case Map.get(params, "ssr_on", nil) do
        nil -> Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)[:ssr_on]
        "false" -> false
        _ -> true
      end

    # assume any value provided other than nil is truthy
    {_header, subdomain} =
      Enum.find(conn.req_headers, {"", nil}, fn
        {"x-subdomain", _} -> true
        _ -> false
      end)

    case {ssr_on, subdomain} do
      {_, "plugin"} ->
        render(conn, "internal.html", app_name: "plugin", entrypoint: "main", root_id: "plugin")

      {_, "app"} ->
        render(conn, "internal.html", app_name: "auth", entrypoint: "main")

      {true, subdomain} ->
        conn = put_layout(conn, {QuickstartWeb.LayoutView, "app.ssr.html"})

        [host: host, port: port] =
          Application.get_env(:quickstart_web, QuickstartWeb.Endpoint)
          |> Keyword.get(:ssr_node_server)

        page_data = get_page_data(conn, path, subdomain)

        [html, scripts, css, styles, links, computed_state] =
          HTTPoison.post(
            "#{host}:#{port}#{path}",
            Jason.encode!(page_data),
            [{"content-type", "application/json"}]
          )
          |> autoretry(
            max_attempts: 3,
            wait: 3000,
            retry_unknown_errors: true
          )
          |> handle_response()

        # render(conn, "marketing.html", app_name: "marketing", entrypoint: "main")

        render(conn, "marketing.html", %{
          html: String.trim(html),
          app_name: "marketing",
          scripts: scripts,
          css: css,
          styles: styles,
          links: links,
          ld_json: nil,
          initial_state: Jason.encode!(computed_state),
          title: Map.get(page_data, :title, @default_title),
          description: Map.get(page_data, :description, @default_description),
          # og_title: Map.get(page_data, :og_title, @default_og_title),
          og_type: Map.get(page_data, :og_type, ""),
          og_url: Map.get(page_data, :og_url, "")
          # og_image: Map.get(page_data, :og_image, @default_og_image)
        })

      _ ->
        render(conn, "marketing.html", app_name: "marketing", entrypoint: "main")
    end
  end

  defp handle_response({:ok, %HTTPoison.Response{body: body}}) do
    [_html, _scripts, _css, _styles, _links, _computed_state] = Jason.decode!(body)
  end

  defp get_page_data(_conn, _path, subdomain) do
    app_name =
      case subdomain do
        "producer" -> "auth"
        _ -> "marketing"
      end

    %{
      actions: [
        # react_responsive_action(conn)
      ],
      state: %{},
      app_name: app_name
    }
  end
end
