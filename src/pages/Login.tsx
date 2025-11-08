import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      toast.success("Welcome to PigMint Finance!");
      navigate("/dashboard");
    } else {
      toast.error("Please enter a User ID");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Coins className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">PigMint Finance</h1>
          <p className="text-muted-foreground">Your daily savings, one mint at a time.</p>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Enter your User ID to log in</Label>
              <Input
                id="userId"
                type="text"
                placeholder="user123"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
