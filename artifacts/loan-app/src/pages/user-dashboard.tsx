import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetMyLoans, useRequestLoan, getGetMyLoansQueryKey, Loan, LoanEstado } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Clock } from "lucide-react";

const requestLoanSchema = z.object({
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
});

function StatusBadge({ estado }: { estado: LoanEstado }) {
  if (estado === "APROBADO") return <Badge variant="success">Aprobado</Badge>;
  if (estado === "RECHAZADO") return <Badge variant="destructive">Rechazado</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}

export default function UserDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loans = [], isLoading } = useGetMyLoans({
    query: { queryKey: getGetMyLoansQueryKey() }
  });

  const form = useForm<z.infer<typeof requestLoanSchema>>({
    resolver: zodResolver(requestLoanSchema),
    defaultValues: { monto: 0 },
  });

  const requestLoanMutation = useRequestLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Préstamo solicitado", description: "Su solicitud ha sido enviada correctamente." });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getGetMyLoansQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Hubo un problema al solicitar el préstamo.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof requestLoanSchema>) => {
    requestLoanMutation.mutate({ data: { monto: values.monto } });
  };

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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Mi Panel</h2>
        <p className="text-muted-foreground mt-2">Gestione sus solicitudes de préstamo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Nuevo Préstamo
              </CardTitle>
              <CardDescription>Ingrese el monto que desea solicitar.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Solicitado</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input type="number" placeholder="100000" className="pl-7" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={requestLoanMutation.isPending}
                  >
                    {requestLoanMutation.isPending ? "Procesando..." : "Solicitar Préstamo"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Mis Préstamos
              </CardTitle>
              <CardDescription>Historial de sus solicitudes recientes.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando préstamos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan: Loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{formatDate(loan.fechaSolicitud)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(loan.monto)}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge estado={loan.estado} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
