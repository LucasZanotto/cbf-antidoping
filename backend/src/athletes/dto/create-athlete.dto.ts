export class CreateAthleteDto {
  cbfCode: string;
  fullName: string;
  birthDate: string; // ISO
  nationality: string;
  cpf: string;
  sex: 'M' | 'F' | 'O';
}
