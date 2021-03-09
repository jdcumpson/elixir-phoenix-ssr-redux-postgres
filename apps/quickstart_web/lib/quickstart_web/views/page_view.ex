defmodule QuickstartWeb.PageView do
  use QuickstartWeb, :view

  def asset_paths(app_name) do
    app_name
    |> String.to_atom()
    |> QuickstartWeb.Manifest.get_manifest()
    |> Map.values()
  end
end
