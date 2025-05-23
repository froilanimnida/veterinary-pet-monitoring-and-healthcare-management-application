import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui";
import Link from "next/link";
import UserLoginForm from "@/components/form/user-login-form";
import Logo from "@/components/shared/logo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
    title: "Pawsitive | Login",
    description: "Login to your account",
};

const LoginPage = async () => {
    const session = await getServerSession(authOptions);
    return (
        <div className="flex justify-center flex-col items-center p-5 gap-5 w-full h-screen bg-yellow-50">
            <div className="flex items-center justify-center gap-4">
                <Logo />
            </div>
            <Card className="max-w-[768px] bg-white rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome Back</CardTitle>
                    <CardDescription>Login to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserLoginForm
                        role={session?.user?.role}
                        sessionName={session?.user?.name ?? ""}
                        exists={session?.user?.email ? true : false}
                        sessionEmail={session?.user?.email ?? ""}
                    />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
};

export default LoginPage;
