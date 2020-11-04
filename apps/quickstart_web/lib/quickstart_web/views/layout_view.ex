defmodule QuickstartWeb.LayoutView do
  use QuickstartWeb, :view

  def assets(filters, ends_with \\ "") do
    case Application.get_env(:quickstart_web, :manifest_cache) do
      nil -> []
      mod -> mod.get(filters, ends_with)
    end
  end
end
