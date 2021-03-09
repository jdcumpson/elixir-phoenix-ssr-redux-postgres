defmodule QuickstartWeb.Channels.ExampleChannel do
  use QuickstartWeb, :channel
  alias QuickstartWeb.Presence

  def join("room:lobby", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    # do something async
    # ex
    # broadcast_from!(socket, "connect", payload)
  end

  def code_change(old_vsn, arg2, extra) do
    IO.puts("code_change")
    IO.inspect(old_vsn)
    IO.inspect(arg2)
    IO.inspect(extra)
  end
end
