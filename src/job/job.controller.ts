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
  HttpCode,
  HttpStatus,
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

    const result = this.jobService.createJob(userId, dto, photos, documents);

    return {
      success: true,
      message: "Job Created Success",
      data: result
    }

  };


  @Patch('updateJob/:jobId')
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update Job (PATCH behaviour)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobTitle: { type: 'string' },
        jobType: { type: 'string' },
        projectDescription: { type: 'string' },

        elevatorType: { type: 'string' },
        numberOfElevator: { type: 'string', example: '2' },
        capacity: { type: 'string' },
        speed: { type: 'string' },
        address: { type: 'string' },
        streetAddress: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' },
        estimatedBudget: { type: 'string' },

        // 🔥 Certifications
        existingTechnicalRequirementsAndCertifications: {
          type: 'array',
          items: { type: 'string' },
          example: ['Cert A'],
        },
        technicalRequirementsAndCertifications: {
          type: 'array',
          items: { type: 'string' },
          example: ['Cert B'],
        },

        // photos
        existingPhotos: {
          type: 'array',
          items: { type: 'string' },
        },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },

        // documents
        existingDocuments: {
          type: 'array',
          items: { type: 'string' },
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

    const parseArray = (v: any): string[] =>
      !v ? [] : Array.isArray(v) ? v : [v];

    body.existingPhotos = parseArray(body.existingPhotos);
    body.existingDocuments = parseArray(body.existingDocuments);

    body.existingTechnicalRequirementsAndCertifications =
      parseArray(body.existingTechnicalRequirementsAndCertifications)
        .map(v => v.trim())
        .filter(Boolean);

    body.technicalRequirementsAndCertifications =
      parseArray(body.technicalRequirementsAndCertifications)
        .map(v => v.trim())
        .filter(Boolean);

    if (body.numberOfElevator !== undefined) {
      const n = parseInt(body.numberOfElevator, 10);
      if (isNaN(n) || n < 0) {
        throw new BadRequestException(
          'numberOfElevator must be a valid number',
        );
      }
      body.numberOfElevator = n;
    }

    return this.jobService.updateJob(
      userId,
      jobId,
      body,
      files?.photos ?? [],
      files?.documents ?? [],
    );
  }

  @Delete("/job/delete/:jobId")
  @UseGuards(AuthGuard('jwt'), UserGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Delete Job Only Can Do (USER)"
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
  @ApiOperation({ summary: "Get all open jobs with search, filter, and pagination" })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'jobType', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllJob(
    @Query('search') search?: string,
    @Query('jobType') jobType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.jobService.getAllJob({
      search,
      jobType,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return {
      success: true,
      message: "All Jobs Retrieved Successfully",
      data: result,
    };
  }

  @Get("get-myJob")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get my jobs with search, filter, and pagination" })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by job title or project description' })
  @ApiQuery({ name: 'jobType', required: false, type: String, description: 'Filter by jobType' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of jobs per page' })
  @HttpCode(HttpStatus.OK)
  async getMyAllJob(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('jobType') jobType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const userId = req.user.userId;

    const result = await this.jobService.getMyAllJob(userId, {
      search,
      jobType,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return {
      success: true,
      message: "My jobs retrieved successfully!",
      data: result,
    };
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
  @Patch("jobs/:jobId/cancle-ready-for-review")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark a job as ready for review (Only For Job Owner)"
  })
  async canclePendingReview(
    @Param("jobId") jobId: string,
    @Req() req: any
  ) {
    const userId = req.user.userId;

    const result = await this.jobService.canclePendingReview(jobId, userId);

    return {
      success: true,
      message: "Job Pending Review Cancle",
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
  @Post("close-Job")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all jobs (Admin)"
  })
  async closeJOb(@Query("jobId") jobId: string) {
    const result = await this.jobService.closeJob(jobId);

    return {
      success: true,
      message: "Job Closed Successfully",
      data: result
    }

  }

}
