export class UpdateTestOrderDto {
  status?: 
    | 'REQUESTED'
    | 'ASSIGNED'
    | 'COLLECTING'
    | 'SHIPPED'
    | 'RECEIVED'
    | 'ANALYZING'
    | 'COMPLETED'
    | 'VOID';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string; // se quiser adicionar depois em coluna própria
}
