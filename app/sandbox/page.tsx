import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Sandbox() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        <div className="mt-16 w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ShadCN Card Component</CardTitle>
              <CardDescription>
                This is a test of the Card component installed via ShadCN MCP server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The Card component is now installed and working! You can use it to create
                beautiful card layouts with headers, content, and footers.
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Card footer content goes here
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Card Example</CardTitle>
              <CardDescription>
                Cards can be used for various content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">This card demonstrates:</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>CardHeader with title and description</li>
                  <li>CardContent for main content</li>
                  <li>CardFooter for additional information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
