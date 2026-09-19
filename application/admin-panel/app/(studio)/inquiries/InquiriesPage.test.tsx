import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InquiriesPage from "./page";
import InquiryThreadPage from "./[id]/page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "i1" }),
}));
vi.mock("@/services/studio", () => ({
  fetchInquiries: vi.fn(),
  fetchInquiry: vi.fn(),
  fetchInquiryMessages: vi.fn(),
  replyInquiry: vi.fn(),
  patchInquiry: vi.fn(),
}));

import { fetchInquiries, fetchInquiry, fetchInquiryMessages, replyInquiry } from "@/services/studio";

describe("Inquiries", () => {
  it("lists threads", async () => {
    vi.mocked(fetchInquiries).mockResolvedValue([
      { id: "i1", user_id: "u1", subject: "Oak oil", message: "Hello", status: "OPEN", guest_email: null, guest_name: null },
    ]);
    render(<InquiriesPage />);
    expect(await screen.findByText("Oak oil")).toBeInTheDocument();
  });

  it("shows a thread and sends a reply", async () => {
    vi.mocked(fetchInquiry).mockResolvedValue({
      id: "i1",
      user_id: "u1",
      subject: "Oak oil",
      message: "Hello",
      status: "OPEN",
      guest_email: null,
      guest_name: null,
    });
    vi.mocked(fetchInquiryMessages).mockResolvedValue([
      { id: "m1", inquiry_id: "i1", sender_user_id: "u1", body: "Hello", is_from_admin: false, is_read: false },
    ]);
    vi.mocked(replyInquiry).mockResolvedValue({
      id: "m2",
      inquiry_id: "i1",
      sender_user_id: "a1",
      body: "Natural oil",
      is_from_admin: true,
      is_read: false,
    });
    render(<InquiryThreadPage />);
    expect((await screen.findAllByText("Hello")).length).toBeGreaterThan(0);
    await userEvent.type(screen.getByPlaceholderText(/reply to the customer/i), "Natural oil");
    await userEvent.click(screen.getByRole("button", { name: /send reply/i }));
    expect(await screen.findByText("Natural oil")).toBeInTheDocument();
  });
});
