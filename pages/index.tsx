import { useLogin, useLoginWithOAuth, useOAuthTokens } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Use this result to pass props to a page for server rendering or to drive redirects!
    // ref https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props
    console.log({ claims });

    return {
      props: {},
      redirect: { destination: "/dashboard", permanent: false },
    };
  } catch (error) {
    return { props: {} };
  }
};

export default function LoginPage() {
  const {
    initOAuth,
  } = useLoginWithOAuth({
    onComplete: () => router.push("/dashboard"),
    onError: (error) => {
      console.log(error);
    },
  });
  
  useOAuthTokens({
    onOAuthTokenGrant: (args) => {
      console.log('OAuth tokens granted', args);
    }
  })

  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/dashboard"),
  });

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen p-6 login-container">
        {/* Logo */}
        <img
          src="images/login-logo.svg"
          alt="App Logo"
          className="w-20 h-auto mb-4"
        />

        {/* Login Title */}
        <h1 className="text-xl font-semibold mb-6 text-center">
          Login or Sign Up
        </h1>

        {/* Buttons */}
        <button
          className="flex items-center justify-center w-full max-w-xs bg-white hover:bg-indigo-700 hover:text-white py-3 px-4 rounded-lg border border-black mb-4"
          onClick={() => initOAuth({ provider: 'google' })}
        >
          <span className="w-6 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1920px-Google_%22G%22_logo.svg.png?20230822192911')] bg-contain bg-no-repeat mr-2"></span>
          Continue with Google
        </button>

        <button
          className="flex items-center justify-center w-full max-w-xs bg-white hover:bg-indigo-700 hover:text-white py-3 px-4 rounded-lg border border-black mb-4"
          onClick={login}
        >
          <span className="w-6 h-6 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/1024px-Telegram_logo.svg.png?20220101141644')] bg-contain bg-no-repeat mr-2"></span>
          Continue with Telegram
        </button>

        {/* Terms and Conditions */}
        <p className="text-sm text-center mt-6">
          By logging in, you agree to our <br />
          <a href="#" className="text-indigo-600 underline">
            Terms of Service
          </a>
          &nbsp;&&nbsp;
          <a href="#" className="text-indigo-600 underline">
            Privacy Policy
          </a>
        </p>
      </main>
    </>
  );
}
