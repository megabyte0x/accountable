"use client";

import { useEffect, useState, useCallback } from "react";
import sdk, { type Context, type FrameNotificationDetails, AddFrame } from "@farcaster/frame-sdk";
import { createStore } from "mipd";
import React from "react";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.FrameContext | undefined;
}

const FrameContext = React.createContext<FrameContextType | undefined>(undefined);

export function useFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails | null>(null);
  const [lastEvent, setLastEvent] = useState("");
  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const context = await sdk.context;
        if (!mounted) return;

        setContext(context);
        setIsSDKLoaded(true);

        // Set up event listeners
        sdk.on("frameAdded", ({ notificationDetails }) => {
          if (!mounted) return;
          console.log("Frame added", notificationDetails);
          setAdded(true);
          setNotificationDetails(notificationDetails ?? null);
          setLastEvent("Frame added");
        });

        sdk.on("frameAddRejected", ({ reason }) => {
          if (!mounted) return;
          console.log("Frame add rejected", reason);
          setAdded(false);
          setLastEvent(`Frame add rejected: ${reason}`);
        });

        sdk.on("frameRemoved", () => {
          if (!mounted) return;
          console.log("Frame removed");
          setAdded(false);
          setLastEvent("Frame removed");
        });

        sdk.on("notificationsEnabled", ({ notificationDetails }) => {
          if (!mounted) return;
          console.log("Notifications enabled", notificationDetails);
          setNotificationDetails(notificationDetails ?? null);
          setLastEvent("Notifications enabled");
        });

        sdk.on("notificationsDisabled", () => {
          if (!mounted) return;
          console.log("Notifications disabled");
          setNotificationDetails(null);
          setLastEvent("Notifications disabled");
        });

        sdk.on("primaryButtonClicked", () => {
          if (!mounted) return;
          console.log("Primary button clicked");
          setLastEvent("Primary button clicked");
        });

        // Call ready action
        console.log("Calling ready");
        sdk.actions.ready({});

        // Set up MIPD Store
        const store = createStore();
        store.subscribe((providerDetails) => {
          if (!mounted) return;
          console.log("PROVIDER DETAILS", providerDetails);
        });
      } catch (error) {
        console.error("Error initializing frame SDK:", error);
      }
    };

    if (typeof window !== 'undefined' && sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        mounted = false;
        sdk.removeAllListeners();
      };
    }

    return () => {
      mounted = false;
    };
  }, [isSDKLoaded]);

  return { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult };
}

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isSDKLoaded, context } = useFrame();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return children directly during SSR to avoid hydration mismatch
    return <>{children}</>;
  }

  return (
    <FrameContext.Provider value={{ isSDKLoaded, context }}>
      {children}
    </FrameContext.Provider>
  );
} 