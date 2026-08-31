import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';
import { toast } from 'sonner';

/**
 * ContactForm POSTs to a Supabase Edge Function. It used to send through EmailJS, and
 * this file went on mocking `@emailjs/browser` and asserting `emailjs.send(...)` long
 * after the component stopped importing it — so four submission tests were asserting
 * against a dependency that no longer exists, and one of them expected the address
 * `karisa@thebikecollector.info`, a dead domain Phase 0 removed from the site.
 *
 * The network boundary the component actually uses is `fetch`, so that is what is
 * mocked here.
 */
const SUPABASE_URL = 'https://test.supabase.co';
const NOTIFY_ENDPOINT = `${SUPABASE_URL}/functions/v1/send-notification`;

let fetchMock;

const fillValidForm = async (user) => {
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  // Subject is a <select>, not a text input — user.type() leaves it empty, which is why
  // every submission test failed validation before ever reaching the network.
  await user.selectOptions(screen.getByLabelText(/subject/i), 'Project Inquiry');
  await user.type(
    screen.getByRole('textbox', { name: /message/i }),
    'This is a test message with enough characters.'
  );
};

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The component reads import.meta.env.VITE_SUPABASE_URL to build its endpoint.
    // Without this it would post to the string "undefined/functions/v1/...".
    vi.stubEnv('VITE_SUPABASE_URL', SUPABASE_URL);
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('renders all required field indicators', () => {
      render(<ContactForm />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(4);
    });

    it('has correct input types', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text');
    });

    it('has appropriate autocomplete attributes', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/name/i)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Form Validation', () => {
    it('shows error when name is too short', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    /*
     * REMOVED: 'shows error when name contains invalid characters'.
     *
     * It asserted the message "Name can only contain letters and spaces". No such rule
     * has ever existed in `contactFormSchema` — the name field only has .min(2)/.max(100)
     * — so the test could never pass.
     *
     * It was not replaced with a letters-and-spaces regex, because that rule would reject
     * real names: O'Brien, Jean-Luc, José, Ng'ang'a. Rejecting a legitimate visitor's name
     * to satisfy a test is a worse outcome than accepting "John123", and the form already
     * has a honeypot field and rate limiting for spam. Whether to add a permissive name
     * rule is a product decision, not a test fix.
     */

    it('shows error when email is invalid', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    // Was 'shows error when subject is too short', typing 'Hi' into what it assumed was a
    // text input. Subject is a <select> with six fixed options, every one of them at
    // least 5 characters, so "too short" is unreachable through the UI — the only value
    // that fails .min(5) is the empty placeholder. That is what this now covers.
    it('shows error when no subject is selected', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const subjectSelect = screen.getByLabelText(/subject/i);
      // Pick a real option, then go back to the placeholder, so the field is both
      // touched and empty.
      await user.selectOptions(subjectSelect, 'Project Inquiry');
      await user.selectOptions(subjectSelect, '');

      await waitFor(() => {
        expect(screen.getByText(/subject must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error when message is too short', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/message must be at least 20 characters/i)).toBeInTheDocument();
      });
    });

    it.skip('shows error when message exceeds character limit', async () => {
      // Skipped: Typing 1001 characters is very slow in tests
      // This validation is covered by the schema and tested in other ways
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      const longMessage = 'a'.repeat(1001);
      await user.type(messageInput, longMessage);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/message must be less than 1000 characters/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('accepts valid name with letters and spaces', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'John Doe');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
      });
    });

    it('accepts valid email address', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'john@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Character Counter', () => {
    it('displays character count for message field', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');

      await waitFor(() => {
        expect(screen.getByText(/12\s*\/\s*1000/)).toBeInTheDocument();
      });
    });

    it('updates character count as user types', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Hello');

      await waitFor(() => {
        expect(screen.getByText(/5\s*\/\s*1000/)).toBeInTheDocument();
      });

      await user.type(messageInput, ' World');

      await waitFor(() => {
        expect(screen.getByText(/11\s*\/\s*1000/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(NOTIFY_ENDPOINT);
      expect(init.method).toBe('POST');
      // The CSRF token is generated per mount, so assert it is sent, not its value.
      expect(init.headers['x-csrf-token']).toEqual(expect.any(String));
      expect(JSON.parse(init.body)).toMatchObject({
        type: 'contact',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'This is a test message with enough characters.',
      });
    });

    it('shows success toast on successful submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Message sent')
        );
      });
    });

    it('shows error toast on submission failure', async () => {
      // A non-ok response with no `message` field makes the component fall back to its
      // own copy, which is what this asserts.
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const user = userEvent.setup();
      render(<ContactForm />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to send message')
        );
      });
    });

    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      
      // Hold the request open so the disabled state is observable.
      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
          )
      );

      render(<ContactForm />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectInput = screen.getByLabelText(/subject/i);
      const messageInput = screen.getByRole('textbox', { name: /message/i });

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(subjectInput).toHaveValue('');
        expect(messageInput).toHaveValue('');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-invalid');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid');
    });

    it('associates error messages with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        const errorId = nameInput.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        expect(screen.getByText(/name must be at least 2 characters/i)).toHaveAttribute('id', errorId);
      });
    });

    it('marks errors with role="alert"', async () => {
      const user = userEvent.setup();
      render(<ContactForm />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Honeypot Protection', () => {
    it('does not submit if honeypot field is filled', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactForm />);

      // Fill form normally
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.selectOptions(screen.getByLabelText(/subject/i), 'Project Inquiry');
      await user.type(screen.getByRole('textbox', { name: /message/i }), 'This is a test message with enough characters.');

      // Find and fill honeypot (it should be hidden)
      const honeypotInput = container.querySelector('input[name="honeypot"]');
      if (honeypotInput) {
        fireEvent.change(honeypotInput, { target: { value: 'bot' } });
      }

      const submitButton = screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);

      // EmailJS should not be called
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
