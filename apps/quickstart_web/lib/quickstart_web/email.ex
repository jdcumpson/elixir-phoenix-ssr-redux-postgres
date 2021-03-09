defmodule QuickstartWeb.Email do
  use Bamboo.Phoenix, view: QuickstartWeb.EmailView
  require Logger

  @from "JD at Quickstart<jd@quickstart.io>"
  @reply_to @from
  @test_email "cumpsonjd@gmail.com"

  def send_new_lead(email) do
    to_email =
      if Mix.env() == :dev do
        Logger.info("Replacing email send to #{@test_email}, in dev mode")
        @test_email
      else
        email
      end

    new_email()
    |> to(to_email)
    |> from(@from)
    |> subject("🎉 Welcome to Quickstart! 🎉")
    |> put_header("Reply-To", @reply_to)
    |> put_html_layout({QuickstartWeb.LayoutView, "email.html"})
    |> render("lead.html")
    |> Quickstart.Mailer.deliver_later()
  end
end
