
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import Container from "@/components/layout/Container";
import ThemeToggle from "@/components/ThemeToggle";

const AuthPage = () => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <h1 
              onClick={() => navigate("/")} 
              className="text-xl font-semibold tracking-tight cursor-pointer"
            >
              Unsaid
            </h1>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <main className="py-12">
        <Container>
          <div className="max-w-md mx-auto">
            <Card className="animate-fade-in">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-center">Welcome to Unsaid</CardTitle>
                <CardDescription className="text-center">
                  {tab === "login" ? "Sign in to your account" : "Create a new account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="signup">
                    <SignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                  For IITR students only
                </div>
              </CardFooter>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default AuthPage;
