import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

const Invest = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2">Total Invested</h2>
            <p className="text-5xl font-bold text-primary">$220.50</p>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">Your Investment Portfolio</h3>
            <p className="text-muted-foreground mb-6">
              Your savings are automatically invested in a 'Global Companies ETF' to help your money grow.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <svg
                  viewBox="0 0 400 200"
                  className="w-full h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline
                    points="0,180 50,160 100,140 150,130 200,110 250,100 300,80 350,60 400,50"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                  />
                  <polyline
                    points="0,180 50,160 100,140 150,130 200,110 250,100 300,80 350,60 400,50 400,200 0,200"
                    fill="hsl(var(--primary) / 0.1)"
                  />
                </svg>
                <p className="text-sm text-muted-foreground mt-4">Portfolio Growth Over Time</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Invest;
