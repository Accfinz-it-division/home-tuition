-- CreateTable
CREATE TABLE "ZoomMeeting" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "link" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoomMeeting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ZoomMeeting" ADD CONSTRAINT "ZoomMeeting_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
