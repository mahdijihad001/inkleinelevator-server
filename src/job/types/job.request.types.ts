

export type JobStatus = "OPEN" | "ACCEPTED" | "DECLINED" | "PENDING_REVIEW" | "INPROGRESS" | "COMPLITE"; // adjust according to your enum

export interface Job {
  jobId: string;
  userId: string;

  // Job details
  jobTitle: string;
  jobType: string;
  projectDescription: string;
  technicalDescriptionAndCertification: string;
  elevatorType: string;
  numberOfElevator: number;
  capasity: string;
  speed: string;
  address: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  photo: string;
  documents: string;
  estimitedBudget: string;



  paymentId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
