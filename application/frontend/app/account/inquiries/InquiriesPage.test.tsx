import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiRequestError } from "@/lib/api";
import InquiriesPage from "./page";

const { replace, router } = vi.hoisted(() => {
  const replace = vi.fn();
  const push = vi.fn();
  return { replace, router: { replace, push } };
});
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/services/inquiries", () => ({
  fetchInquiries: vi.fn(),
  fetchInquiry: vi.fn(),
  fetchInquiryMessages: vi.fn(),
  sendInquiryMessage: vi.fn(),
  createInquiry: vi.fn(),
}));

import {
  createInquiry,
  fetchInquiries,
  fetchInquiry,
  fetchInquiryMessages,
  sendInquiryMessage,
} from "@/services/inquiries";

const mockedList = vi.mocked(fetchInquiries);
const mockedDetail = vi.mocked(fetchInquiry);
const mockedMsgs = vi.mocked(fetchInquiryMessages);
const mockedSend = vi.mocked(sendInquiryMessage);
const mockedCreate = vi.mocked(createInquiry);

describe("Inquiries page", () => {
  beforeEach(() => {
    replace.mockReset();
    mockedList.mockReset();
    mockedDetail.mockReset();
    mockedMsgs.mockReset();
    mockedSend.mockReset();
    mockedCreate.mockReset();
    mockedDetail.mockResolvedValue({
      id: "i1",
      user_id: "u1",
      subject: "Oak finish",
      message: "Hello",
      status: "OPEN",
      guest_email: null,
      guest_name: null,
    });
  });

  it("shows empty state", async () => {
    mockedList.mockResolvedValue([]);
    render(<InquiriesPage />);
    expect(await screen.findByText(/No inquiries yet/i)).toBeInTheDocument();
  });

  it("lists inquiries and opens a thread", async () => {
    mockedList.mockResolvedValue([
      {
        id: "i1",
        user_id: "u1",
        subject: "Oak finish",
        message: "Hello",
        status: "OPEN",
        guest_email: null,
        guest_name: null,
      },
    ]);
    mockedMsgs.mockResolvedValue([
      {
        id: "m1",
        inquiry_id: "i1",
        sender_user_id: "u1",
        body: "Hello",
        is_from_admin: false,
        is_read: false,
      },
    ]);
    render(<InquiriesPage />);
    expect(await screen.findByText("Oak finish")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Oak finish"));
    expect(await screen.findByText("Hello")).toBeInTheDocument();
  });

  it("sends a message", async () => {
    mockedList.mockResolvedValue([
      {
        id: "i1",
        user_id: "u1",
        subject: "Oak finish",
        message: "Hello",
        status: "OPEN",
        guest_email: null,
        guest_name: null,
      },
    ]);
    mockedMsgs.mockResolvedValue([]);
    mockedSend.mockResolvedValue({
      id: "m2",
      inquiry_id: "i1",
      sender_user_id: "u1",
      body: "Follow up",
      is_from_admin: false,
      is_read: false,
    });
    render(<InquiriesPage />);
    await userEvent.click(await screen.findByText("Oak finish"));
    await userEvent.type(screen.getByPlaceholderText(/Write a reply/i), "Follow up");
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
    await waitFor(() => expect(mockedSend).toHaveBeenCalled());
    expect(await screen.findByText("Follow up")).toBeInTheDocument();
  });

  it("shows API error", async () => {
    mockedList.mockRejectedValue(new Error("network"));
    render(<InquiriesPage />);
    expect(await screen.findByText(/Could not load inquiries/i)).toBeInTheDocument();
  });

  it("redirects when the session has expired", async () => {
    mockedList.mockRejectedValue(new ApiRequestError(401, "Authentication required"));
    render(<InquiriesPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
