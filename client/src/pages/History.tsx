import { useSimulationHistory } from "@/hooks/use-simulation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { data: history, isLoading } = useSimulationHistory();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Simulation Logs</h2>
        <p className="text-muted-foreground">Historical record of all traffic adaptation decisions.</p>
      </div>

      <Card className="border-white/5 bg-card/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>
            {history?.length || 0} total simulations recorded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-white/10">
                <TableHead>Timestamp</TableHead>
                <TableHead>Pedestrians</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Peak Hour</TableHead>
                <TableHead>Green Time</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Explanation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history && history.length > 0 ? (
                history.map((run) => (
                  <TableRow key={run.id} className="hover:bg-white/5 border-white/10">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {run.createdAt} 
                        {/* Note: In a real app, parse ISO string with date-fns */}
                      </div>
                    </TableCell>
                    <TableCell>{run.pedestrians}</TableCell>
                    <TableCell>{run.vehicles}</TableCell>
                    <TableCell>
                      {run.isPeakHour ? (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-primary">{run.calculatedGreenTime}s</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          run.riskLevel === "High" ? "border-red-500/50 text-red-500" :
                          run.riskLevel === "Moderate" ? "border-yellow-500/50 text-yellow-500" :
                          "border-green-500/50 text-green-500"
                        }
                      >
                        {run.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right max-w-[300px] truncate text-muted-foreground text-xs" title={run.explanation}>
                      {run.explanation}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No simulation history found. Run a simulation to see data here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
