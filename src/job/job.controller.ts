import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
  Param,
  Patch,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JobService } from './job.service';
import { CreateJobDto, updateJobDto } from './dto/create.job.dto';
import { AdminGuard } from 'src/guard/admin.guard';
import { UserGuard } from 'src/guard/user.guard';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) { }
  @Post('createJob')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string' },
        jobType: { type: 'string' },
        projectDescription: { type: 'string' },
        technicalRequirementsAndCertifications: {
          type: 'array',
          items: { type: 'string' },
        },
        elevatorType: { type: 'string' },
        numberOfElevator: { type: 'number' },
        capacity: { type: 'string' },
        speed: { type: 'string' },
        address: { type: 'string' },
        streetAddress: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' },
        estimatedBudget: { type: 'string' },

        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        documents: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'documents', maxCount: 5 },
    ]),
  )
  async createJob(
    @Body() dto: CreateJobDto,
    @Req() req: any,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.userId;

    const photos = files.photos ?? [];
    const documents = files.documents ?? [];


    photos.forEach((file) => {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Photos must be image files');
      }
    });

    documents.forEach((file) => {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Documents must be PDF files');
      }
    });

    return this.jobService.createJob(userId, dto, photos, documents);
  };


  @Patch('updateJob/:jobId')
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Update Job Only Can Do (USER)"
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string', example: 'New Job Title' },
        jobType: { type: 'string', example: 'Installation' },
        projectDescription: { type: 'string', example: 'Project description...' },
        'technicalRequirementsAndCertifications[]': {
          type: 'array',
          items: { type: 'string' },
          description: 'Multiple certifications - use array format in form-data',
          example: ['Cert A', 'Cert B', 'Dada B'],
        },
        elevatorType: { type: 'string', example: 'Hydraulic' },
        numberOfElevator: { type: 'string', example: '2' },
        capacity: { type: 'string', example: '1000kg' },
        speed: { type: 'string', example: '1.5 m/s' },
        address: { type: 'string', example: '123 Main St' },
        streetAddress: { type: 'string', example: 'Block A' },
        city: { type: 'string', example: 'Dhaka' },
        zipCode: { type: 'string', example: '1205' },
        estimatedBudget: { type: 'string', example: '50000' },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload new photos (optional)',
        },
        documents: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload new documents (optional)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'documents', maxCount: 5 },
    ]),
  )
  async updateJob(
    @Param('jobId') jobId: string,
    @Body() body: any,
    @Req() req: any,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.userId;

    const photos = files?.photos ?? [];
    const documents = files?.documents ?? [];


    photos.forEach((file) => {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Photos must be image files');
      }
    });

    documents.forEach((file) => {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Documents must be PDF files');
      }
    });

    let certifications: any = [];

    if (body['technicalRequirementsAndCertifications[]']) {
      const certs = body['technicalRequirementsAndCertifications[]'];
      certifications = Array.isArray(certs) ? certs : [certs];
    }

    else if (body.technicalRequirementsAndCertifications) {
      const certs = body.technicalRequirementsAndCertifications;
      certifications = Array.isArray(certs) ? certs : [certs];
    }

    if (certifications.length > 0) {
      certifications = certifications
        .map((cert: string) => cert?.trim())
        .filter((cert: string) => cert && cert.length > 0);

      body.technicalRequirementsAndCertifications = certifications;
    }

    if (body.numberOfElevator) {
      const parsed = parseInt(body.numberOfElevator, 10);
      if (isNaN(parsed) || parsed < 0) {
        throw new BadRequestException('numberOfElevator must be a valid positive number');
      }
      body.numberOfElevator = parsed;
    }

    return this.jobService.updateJob(
      userId,
      jobId,
      body,
      photos,
      documents,
    );
  }


  @Delete("/job/delete/:jobId")
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Update Job Only Can Do (USER)"
  })
  async deleteJob(@Param("jobId") jobId: string, @Req() req: any) {
    const userId = req.user.userId;

    await this.jobService.deleteJob(jobId, userId);

    return {
      success: true,
      message: "Job Delete Success",
      data: null
    }

  }

  @Get("get-all-job")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "get all job"
  })
  async getAllJOb() {
    const result = await this.jobService.getAllJob();


    return {
      success: true,
      message: "All Job Retrived Successfully",
      data: result
    }

  }

  @Get("get-myJob")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get my all job"
  })
  async getMyAllJob(@Req() req: any) {
    const userId = req.user.userId;

    const result = await this.jobService.getMyAllJOb(userId);

    return {
      success: true,
      message: "My all job retrived successfully!",
      data: result
    }

  }

  @Get("get-single-job/:jobId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "get Single Job"
  })
  async getSingleJOb(@Param("jobId") jobId: string) {
    const result = await this.jobService.getSingleJobs(jobId);

    return {
      success: true,
      message: "Retrive Single Job",
      data: result
    }
  };

  @Patch("jobs/:jobId/ready-for-review")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark a job as ready for review (PENDING_REVIEW)"
  })
  async jobReadyForReview(
    @Param("jobId") jobId: string,
    @Req() req: any
  ) {
    const userId = req.user.userId;

    const result = await this.jobService.pendingReview(jobId, userId);

    return {
      success: true,
      message: "Job marked as ready for review",
      data: result
    };
  }

  @Patch("jobs/:jobId/complete")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark job as completed (Only job owner can complete)"
  })
  async completeJob(
    @Param("jobId") jobId: string,
    @Req() req: any
  ) {
    const userId = req.user.userId;

    const result = await this.jobService.compliteRequest(
      userId,
      jobId
    );

    return {
      success: true,
      message: "Job completed successfully",
      data: result
    };
  }


  @Get("get-all-job-by-admin")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all jobs (Admin)"
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    description: 'Search term to filter jobs by title or description'
  })
  async getAllJobByAdmin(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('searchTerm') searchTerm?: string
  ) {

    const result = await this.jobService.jobManagementByAdmin(page, limit, searchTerm);

    return {
      success: true,
      message: "All jobs retrived successfully",
      data: result
    }

  }

  @Get("get-all-bidded-company-in-single-job")
  @UseGuards(AuthGuard("jwt"), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all jobs (Admin)"
  })
  async getAllBiddessCompanyByJobId(@Query("jobId") jobId: string) {
    const result = await this.jobService.getAllBiddessCompanyByJobId(jobId);

    return {
      success: true,
      message: "All Bidded Company Retrived Successfully",
      data: result
    }

  }

}
