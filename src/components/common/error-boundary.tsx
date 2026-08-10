"use client";

import { Component, ReactNode } from "react";

// Resettable via the `key` prop: change the key when the thing being
// rendered changes so a previous failure doesn't stick around forever.
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
