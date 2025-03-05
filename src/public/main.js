const subscribeToPush = async () => {
  try {
    console.log("Registering service worker...");

    // Register the service worker
    const register = await navigator.serviceWorker.register("/worker.js", {
      scope: "/",
    });
    console.log("Service worker registered.");

    // Check for an existing subscription
    const existingSubscription = await register.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("Existing subscription found. Unsubscribing...");
      await existingSubscription.unsubscribe();
      console.log("Successfully unsubscribed from the existing subscription.");
    }

    // Create a new subscription
    console.log("Creating new subscription...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.PUBLIC_VAPID_KEY),
    });

    console.log("New subscription created:", subscription);

    // Send the new subscription to the server
    console.log("Sending subscription to the server...");
    await fetch("/subscription", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Subscription successfully sent to the server.");
  } catch (error) {
    console.error("Subscription error:", error);
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Execute the subscription function
subscribeToPush();
