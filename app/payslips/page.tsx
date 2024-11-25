'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths, isBefore, isAfter, parse } from 'date-fns';
import { getEmployeeContracts } from '@/utils/supabase/queries';
import { useTenant } from '@/utils/tenant-context';
import { toast } from '@/components/ui/use-toast';

interface Contract {
  id: string;
  employee_name: string;
  start_date: string;
  end_date: string | null;
  position_title: string;
  contract_type_name: string;
}

export default function PayslipsPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyyMM'));
  const [contracts, setContracts] = useState<Contract[]>([]);
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      loadContracts();
    }
  }, [selectedMonth, currentTenant]);

  const loadContracts = async () => {
    try {
      const supabase = createClient();
      const { contracts: data } = await getEmployeeContracts(supabase, currentTenant!.id);
      if (data) {
        const filteredContracts = data.filter((contract: Contract) => {
          const contractStart = parse(contract.start_date, 'yyyy-MM-dd', new Date());
          const contractEnd = contract.end_date ? parse(contract.end_date, 'yyyy-MM-dd', new Date()) : null;
          const monthStart = parse(`${selectedMonth}01`, 'yyyyMMdd', new Date());
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);

          return (
            (isBefore(contractStart, monthEnd) && (!contractEnd || isAfter(contractEnd, monthStart)))
          );
        });

        // Sort contracts by employee name
        filteredContracts.sort((a, b) => a.employee_name.localeCompare(b.employee_name));

        setContracts(filteredContracts);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRowStyle = (contract: Contract) => {
    const overlapping = contracts.some(otherContract => 
      otherContract.employee_name === contract.employee_name &&
      otherContract.id !== contract.id &&
      isBefore(parse(otherContract.start_date, 'yyyy-MM-dd', new Date()), contract.end_date ? parse(contract.end_date, 'yyyy-MM-dd', new Date()) : new Date()) &&
      isAfter(otherContract.end_date ? parse(otherContract.end_date, 'yyyy-MM-dd', new Date()) : new Date(), parse(contract.start_date, 'yyyy-MM-dd', new Date()))
    );
    return overlapping ? 'bg-red-100' : '';
  };

  const months = Array.from({ length: 13 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(date, 'yyyyMM');
  });

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Payslips</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {format(parse(month, 'yyyyMM', new Date()), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left bg-muted">
                <th className="p-2">Employee</th>
                <th className="p-2">Position</th>
                <th className="p-2">Contract Type</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => (
                <tr 
                  key={contract.id} 
                  className={`border-b hover:bg-muted/50 ${getRowStyle(contract)}`}
                >
                  <td className="p-2">{contract.employee_name}</td>
                  <td className="p-2">{contract.position_title}</td>
                  <td className="p-2">{contract.contract_type_name}</td>
                  <td className="p-2">{format(new Date(contract.start_date), 'dd/MM/yyyy')}</td>
                  <td className="p-2">{contract.end_date ? format(new Date(contract.end_date), 'dd/MM/yyyy') : 'Ongoing'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 