-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleDriveToken" TEXT,
    "googleDriveRefresh" TEXT,
    "driveRootFolderId" TEXT,
    "rollNumber" TEXT,
    "fullName" TEXT,
    "examType" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOfPhotography" TIMESTAMP(3),
    "hasDOPBand" BOOLEAN NOT NULL DEFAULT false,
    "validationStatus" TEXT NOT NULL DEFAULT 'pending',
    "validationErrors" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentArchive" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "driveFileId" TEXT,
    "drivePath" TEXT,
    "localPath" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksumMD5" TEXT,
    "checksumSHA1" TEXT,
    "storageType" TEXT NOT NULL DEFAULT 'drive',

    CONSTRAINT "DocumentArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentMaster" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "driveFileId" TEXT,
    "drivePath" TEXT,
    "localPath" TEXT,
    "fileSize" INTEGER NOT NULL,
    "originalWidth" INTEGER,
    "originalHeight" INTEGER,
    "enhancedWidth" INTEGER,
    "enhancedHeight" INTEGER,
    "enhancementPipeline" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "processingTime" INTEGER,
    "isUpscaled" BOOLEAN NOT NULL DEFAULT false,
    "isDenoised" BOOLEAN NOT NULL DEFAULT false,
    "isContrastAdjusted" BOOLEAN NOT NULL DEFAULT false,
    "isSharpened" BOOLEAN NOT NULL DEFAULT false,
    "isColorCorrected" BOOLEAN NOT NULL DEFAULT false,
    "textExtracted" TEXT,
    "faceDetected" BOOLEAN NOT NULL DEFAULT false,
    "documentAnalysis" TEXT,
    "storageType" TEXT NOT NULL DEFAULT 'drive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentZip" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "userId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "driveFileId" TEXT,
    "drivePath" TEXT,
    "localPath" TEXT,
    "fileSize" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "validationPassed" BOOLEAN NOT NULL DEFAULT false,
    "includedDocuments" TEXT NOT NULL,
    "rollNumber" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "storageType" TEXT NOT NULL DEFAULT 'drive',

    CONSTRAINT "DocumentZip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnhancementJob" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "enhancementType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "processingTime" INTEGER,
    "memoryUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnhancementJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsedDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "examName" TEXT NOT NULL,
    "examType" TEXT,
    "source" TEXT NOT NULL DEFAULT 'text-input',
    "parsedJson" JSONB NOT NULL,
    "originalText" TEXT,
    "confidence" DOUBLE PRECISION,
    "documentCount" INTEGER,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3),

    CONSTRAINT "ParsedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "DocumentArchive_documentId_idx" ON "DocumentArchive"("documentId");

-- CreateIndex
CREATE INDEX "DocumentArchive_fileHash_idx" ON "DocumentArchive"("fileHash");

-- CreateIndex
CREATE INDEX "DocumentArchive_driveFileId_idx" ON "DocumentArchive"("driveFileId");

-- CreateIndex
CREATE INDEX "DocumentMaster_documentId_idx" ON "DocumentMaster"("documentId");

-- CreateIndex
CREATE INDEX "DocumentMaster_qualityScore_idx" ON "DocumentMaster"("qualityScore");

-- CreateIndex
CREATE INDEX "DocumentMaster_driveFileId_idx" ON "DocumentMaster"("driveFileId");

-- CreateIndex
CREATE INDEX "DocumentZip_userId_examType_idx" ON "DocumentZip"("userId", "examType");

-- CreateIndex
CREATE INDEX "DocumentZip_fileHash_idx" ON "DocumentZip"("fileHash");

-- CreateIndex
CREATE INDEX "DocumentZip_driveFileId_idx" ON "DocumentZip"("driveFileId");

-- CreateIndex
CREATE INDEX "EnhancementJob_status_priority_idx" ON "EnhancementJob"("status", "priority");

-- CreateIndex
CREATE INDEX "EnhancementJob_documentId_idx" ON "EnhancementJob"("documentId");

-- CreateIndex
CREATE INDEX "ParsedDocument_userId_idx" ON "ParsedDocument"("userId");

-- CreateIndex
CREATE INDEX "ParsedDocument_examType_idx" ON "ParsedDocument"("examType");

-- CreateIndex
CREATE INDEX "ParsedDocument_examName_idx" ON "ParsedDocument"("examName");

-- CreateIndex
CREATE INDEX "ParsedDocument_createdAt_idx" ON "ParsedDocument"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentArchive" ADD CONSTRAINT "DocumentArchive_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentMaster" ADD CONSTRAINT "DocumentMaster_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentZip" ADD CONSTRAINT "DocumentZip_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentZip" ADD CONSTRAINT "DocumentZip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParsedDocument" ADD CONSTRAINT "ParsedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
