export interface JobBidProposalInterface {
    userId: string;
    jobId: string;
    bidAmount: number;          // matches Prisma Int
    timeline: number;           // matches Prisma Int
    completionTimeline: string; // stays string
    brefProposal: string;
}
