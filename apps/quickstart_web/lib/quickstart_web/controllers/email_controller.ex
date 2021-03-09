defmodule QuickstartWeb.EmailController do
  use QuickstartWeb, :controller

  plug(:put_layout, {QuickstartWeb.LayoutView, "email.html"})

  def index(conn, %{"path" => path} = params) do
    render(conn, "#{path}.html", params)
  end
end
