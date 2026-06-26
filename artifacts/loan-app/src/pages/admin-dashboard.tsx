import { useGetAllLoans, useApproveLoan, useRejectLoan, getGetAllLoansQueryKey, Loan, LoanEstado } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2 } from "lucide-react";

function StatusBadge({ estado }: { estado: LoanEstado }) {
  if (estado === "APROBADO") return <Badge variant="success">Aprobado</Badge>;
  if (estado === "RECHAZADO") return <Badge variant="destructive">Rechazado</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loans = [], isLoading } = useGetAllLoans({
    query: { queryKey: getGetAllLoansQueryKey() }
  });

  const approveMutation = useApproveLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Préstamo aprobado", description: "El estado se actualizó correctamente." });
        queryClient.invalidateQueries({ queryKey: getGetAllLoansQueryKey() });
      },
    }
  });

  const rejectMutation = useRejectLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Préstamo rechazado", description: "El estado se actualizó correctamente.", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: getGetAllLoansQueryKey() });
      },
    }
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Panel de Administración
        </h2>
        <p className="text-muted-foreground mt-2">Gestione y evalúe las solicitudes de préstamos de todos los usuarios.</p>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Todas las Solicitudes</CardTitle>
          <CardDescription>
            {loans.length} solicitud{loans.length !== 1 ? "es" : ""} en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando datos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan: Loan) => (
                  <TableRow key={loan.id} className="group">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(loan.fechaSolicitud)}
                    </TableCell>
                    <TableCell className="font-medium">{loan.userEmail}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(loan.monto)}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge estado={loan.estado} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {loan.estado === "PENDIENTE" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                            onClick={() => approveMutation.mutate({ id: loan.id })}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => rejectMutation.mutate({ id: loan.id })}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">Resuelto</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
