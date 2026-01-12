export type Category = 'Fútbol' | 'F. Sala' | 'Femenino' | 'Entrenadores';
export type Position = 'Portero' | 'Cierre' | 'Ala' | 'Pivot' | 'Ala/Cierre' | 'Ala/Pivot' | 'Defensa' | 'Mediocentro' | 'Extremo' | 'Delantero' | 'Entrenador';
export type PreferredFoot = 'Derecha' | 'Izquierda' | 'Ambas' | 'Ambidiestro';
export type PayerType = 'Club' | 'Jugador' | 'Ambos';
export type ScoutingStatus = 'No contactado' | 'Contactado' | 'Negociando';

export interface DynamicField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];
    category?: Category | 'General';
}

export interface PlayerSeason {
    season: string;
    team: string;
    league: string;
}

export interface PlayerContract {
    endDate: string;
    clause: string;
    optional?: string;
    optionalNoticeDate?: string;
    conditions?: string;
}

export interface ScoutingInfo {
    status: string;
    notes: string;
    currentAgent: string;
    agentEndDate: string;
    contractType: string;
    contractEnd: string;
    lastContactDate: string;
}

export interface ProneoLink {
    contractDate: string;
    agencyEndDate: string;
    commissionPct: number;
    payerType: PayerType;
}

export type PaymentStatus = 'Pendiente' | 'Pagado' | 'Pospuesto' | 'Cancelado';

export interface PaymentInfo {
    status: PaymentStatus;
    paymentDate?: string;
    dueDate?: string;
    isPaid: boolean;
    notes?: string;
}

export interface ContractYear {
    id: string;
    year: string;
    salary: number;
    clubCommissionPct: number;
    playerCommissionPct: number;
    clubPayment: PaymentInfo;
    playerPayment: PaymentInfo;
    globalStatus: PaymentStatus;
}

export interface Player {
    id: string;
    firstName: string;
    lastName1: string;
    lastName2: string;
    name: string;
    nationality: string;
    birthDate: string;
    age: number;
    club: string;
    league: string;
    position: Position;
    preferredFoot: PreferredFoot;
    category: Category;
    contract: PlayerContract;
    proneo: ProneoLink;
    sportsBrand?: string;
    sportsBrandEndDate?: string;
    selection?: string;
    monitoringAgent?: string;
    seasons: PlayerSeason[];
    salaries: {
        year1: number;
        year2: number;
        year3: number;
        year4: number;
    };
    isScouting: boolean;
    scouting?: ScoutingInfo;
    contractYears?: ContractYear[];
    customFields: Record<string, any>;
    photoUrl?: string;
    documents: { id: string; name: string; url: string }[];
    achievements?: string; // Palmarés y Logros
    createdAt: number;
    updatedAt: number;
}
