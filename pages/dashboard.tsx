import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";

async function verifyTokenOnServer(referralCode?: string) {
  // If you want to pass a referral code, you can attach ?ref=XYZ
  const baseUrl = "https://dev-api.finfun.xyz/api/verify"; // or your deployed endpoint
  let url = baseUrl;
  if (referralCode) {
    url += `?ref=${referralCode}`;
  }

  const accessToken = await getAccessToken();

  const res = await fetch(url, {
    headers: {
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined),
    },
  });

  return res.json();
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState(null);
  const router = useRouter();

  // Extract the "ref" param from the URL if the user was referred
  const { ref } = router.query;

  const { ready, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    // If not authenticated, go to login
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Optional: Once user is authenticated, automatically verify token on server
  useEffect(() => {
    if (ready && authenticated) {
      verifyTokenOnServer(ref as string).then((res) => {
        setVerifyResult(res);
      });
    }
  }, [ready, authenticated, ref]);

  return (
    <>
      <Head>
        <title>Privy Auth + Referral Demo</title>
      </Head>
      <main className="p-6">
        {ready && authenticated && (
          <>
            <h1>Dashboard</h1>
            <button onClick={logout}>Logout</button>

            {verifyResult && (
              <details>
                <summary>Server verify result</summary>
                <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
              </details>
            )}

            <p>User object:</p>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
        )}
      </main>
    </>
  );
}
