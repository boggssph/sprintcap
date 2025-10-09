/**
 * Unit tests for ProfileDisplay component
 */

// Mock next-auth before importing anything that uses it
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfileDisplay from '@/components/ProfileDisplay';

describe('ProfileDisplay', () => {
  const mockUpdate = vi.fn();
  const mockSession = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
      displayName: 'Johnny D'
    },
    expires: '2024-01-01',
    update: mockUpdate
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate
    });

    render(<ProfileDisplay />);

    // Should show skeleton placeholders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders profile picture and display name when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay />
      </SessionProvider>
    );

    const profileDisplay = screen.getByTestId('profile-display');
    expect(profileDisplay).toBeInTheDocument();

    // Check avatar image
    const avatar = screen.getByAltText("Johnny D's profile picture");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');

    // Check display name
    const displayName = screen.getByTestId('display-name');
    expect(displayName).toHaveTextContent('Johnny D');
  });

  it('shows fallback avatar when no profile picture', () => {
    const sessionWithoutImage = {
      ...mockSession,
      user: {
        ...mockSession.user,
        image: null
      }
    };

    mockUseSession.mockReturnValue({
      data: sessionWithoutImage,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={sessionWithoutImage}>
        <ProfileDisplay />
      </SessionProvider>
    );

    // Check fallback avatar shows first letter
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('J'); // First letter of "Johnny D"
  });

  it('uses displayName when available', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay />
      </SessionProvider>
    );

    const displayName = screen.getByTestId('display-name');
    expect(displayName).toHaveTextContent('Johnny D');
  });

  it('falls back to name when displayName not set', () => {
    const sessionWithoutDisplayName = {
      ...mockSession,
      user: {
        ...mockSession.user,
        displayName: null
      }
    };

    mockUseSession.mockReturnValue({
      data: sessionWithoutDisplayName,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={sessionWithoutDisplayName}>
        <ProfileDisplay />
      </SessionProvider>
    );

    const displayName = screen.getByTestId('display-name');
    expect(displayName).toHaveTextContent('John Doe');
  });

  it('falls back to email username when neither displayName nor name set', () => {
    const sessionMinimal = {
      ...mockSession,
      user: {
        ...mockSession.user,
        displayName: null,
        name: null
      }
    };

    mockUseSession.mockReturnValue({
      data: sessionMinimal,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={sessionMinimal}>
        <ProfileDisplay />
      </SessionProvider>
    );

    const displayName = screen.getByTestId('display-name');
    expect(displayName).toHaveTextContent('john'); // Username part of email
  });

  it('applies custom className', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay className="custom-class" />
      </SessionProvider>
    );

    const profileDisplay = screen.getByTestId('profile-display');
    expect(profileDisplay).toHaveClass('custom-class');
  });

  it('respects size prop', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay size="lg" />
      </SessionProvider>
    );

    const profileDisplay = screen.getByTestId('profile-display');
    // Check that it has the large size class
    const avatar = profileDisplay.querySelector('.h-12'); // Large avatar size
    expect(avatar).toBeInTheDocument();
  });

  it('respects orientation prop', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay orientation="vertical" />
      </SessionProvider>
    );

    const profileDisplay = screen.getByTestId('profile-display');
    expect(profileDisplay).toHaveClass('flex-col');
  });

  it('hides name when showName is false', () => {
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    render(
      <SessionProvider session={mockSession}>
        <ProfileDisplay showName={false} />
      </SessionProvider>
    );

    // Avatar should still be there
    const avatar = screen.getByAltText("Johnny D's profile picture");
    expect(avatar).toBeInTheDocument();

    // Display name should not be there
    const displayName = screen.queryByTestId('display-name');
    expect(displayName).not.toBeInTheDocument();
  });

  it('returns null when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate
    });

    const { container } = render(<ProfileDisplay />);

    expect(container.firstChild).toBeNull();
  });
});