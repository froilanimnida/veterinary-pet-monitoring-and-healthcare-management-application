-- CreateEnum
CREATE TYPE "breed_type" AS ENUM ('labrador_retriever', 'german_shepherd', 'golden_retriever', 'bulldog', 'beagle', 'poodle', 'rottweiler', 'yorkshire_terrier', 'dachshund', 'boxer', 'siberian_husky', 'french_bulldog', 'shih_tzu', 'doberman_pinscher', 'cocker_spaniel', 'chihuahua', 'australian_shepherd', 'pomeranian', 'bichon_frise', 'border_collie', 'great_dane', 'miniature_schnauzer', 'saint_bernard', 'bernese_mountain_dog', 'maltese', 'english_springer_spaniel', 'pekingese', 'cavalier_king_charles_spaniel', 'samoyed', 'bulldog_french', 'havanese', 'shiba_inu', 'akita', 'chow_chow', 'weimaraner', 'collie', 'newfoundland', 'persian', 'maine_coon', 'ragdoll', 'british_shorthair', 'siberian', 'bengal', 'scottish_fold', 'sphynx', 'burmese', 'birman', 'abyssinian', 'american_shorthair', 'devon_rex', 'norwegian_forest_cat', 'russian_blue', 'oriental_shorthair', 'american_curl', 'egyptian_maau', 'chartreux', 'manx', 'cornish_rex', 'tonkinese', 'selkirk_rex', 'singapura', 'japanese_bobtail', 'balinese', 'somali', 'turkish_angora');

-- CreateEnum
CREATE TYPE "role_type" AS ENUM ('user', 'admin', 'client', 'veterinarian');

-- CreateEnum
CREATE TYPE "pet_sex_type" AS ENUM ('male', 'female', 'prefer not to say');

-- CreateEnum
CREATE TYPE "species_type" AS ENUM ('dog', 'cat');

-- CreateEnum
CREATE TYPE "user_role_type" AS ENUM ('user', 'vet', 'admin');

-- CreateEnum
CREATE TYPE "veterinary_specialization" AS ENUM ('general_practitioner', 'surgeon', 'dermatologist', 'cardiologist', 'orthopedic', 'dentist', 'ophthalmologist', 'oncologist', 'internal_medicine', 'emergency_and_critical_care', 'behaviorist');

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" SERIAL NOT NULL,
    "appointment_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pet_id" INTEGER,
    "vet_id" INTEGER,
    "appointment_date" TIMESTAMPTZ(6),
    "appointment_type" VARCHAR(50),
    "status" VARCHAR(20),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "educational_content" (
    "content_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "tags" TEXT[],
    "author_id" INTEGER,
    "published_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "educational_content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "contact_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "name" VARCHAR(100),
    "relationship" VARCHAR(50),
    "phone_number" VARCHAR(20),
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "comment_id" SERIAL NOT NULL,
    "post_id" INTEGER,
    "user_id" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "post_id" SERIAL NOT NULL,
    "post_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "health_monitoring" (
    "monitoring_id" SERIAL NOT NULL,
    "monitoring_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pet_id" INTEGER,
    "activity_level" VARCHAR(20),
    "weight_kg" DECIMAL(5,2),
    "temperature_celsius" DECIMAL(4,2),
    "symptoms" TEXT,
    "notes" TEXT,
    "recorded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_monitoring_pkey" PRIMARY KEY ("monitoring_id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "record_id" SERIAL NOT NULL,
    "record_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pet_id" INTEGER,
    "vet_id" INTEGER,
    "visit_date" TIMESTAMPTZ(6),
    "diagnosis" TEXT,
    "treatment" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "medications" (
    "medication_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "usage_instructions" TEXT,
    "side_effects" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("medication_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "type" VARCHAR(50),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "pets" (
    "pet_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "pet_uuid" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "species" "species_type",
    "breed" "breed_type",
    "date_of_birth" DATE,
    "weight_kg" DECIMAL(5,2),
    "sex" "pet_sex_type",
    "medical_history" TEXT,
    "vaccination_status" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("pet_id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "prescription_id" SERIAL NOT NULL,
    "prescription_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pet_id" INTEGER,
    "medication_id" INTEGER,
    "vet_id" INTEGER,
    "dosage" VARCHAR(50),
    "frequency" VARCHAR(50),
    "start_date" DATE,
    "end_date" DATE,
    "refills_remaining" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("prescription_id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "user_id" INTEGER NOT NULL,
    "notification_preferences" JSONB,
    "theme_preferences" JSONB,
    "language_preference" VARCHAR(10) DEFAULT 'en',
    "timezone" VARCHAR(50),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "role" "role_type" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "vaccination_id" SERIAL NOT NULL,
    "pet_id" INTEGER,
    "vaccine_name" VARCHAR(100),
    "administered_date" DATE,
    "next_due_date" DATE,
    "administered_by" INTEGER,
    "batch_number" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("vaccination_id")
);

-- CreateTable
CREATE TABLE "veterinarians" (
    "vet_id" SERIAL NOT NULL,
    "vet_uuid" UUID DEFAULT uuid_generate_v4(),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "license_number" VARCHAR(50) NOT NULL,
    "specialization" "veterinary_specialization",
    "email" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("vet_id")
);

-- CreateTable
CREATE TABLE "clinic_veterinarians" (
    "clinic_id" INTEGER NOT NULL,
    "vet_id" INTEGER NOT NULL,

    CONSTRAINT "clinic_veterinarians_pkey" PRIMARY KEY ("clinic_id","vet_id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "clinic_id" SERIAL NOT NULL,
    "clinic_uuid" UUID DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "phone_number" VARCHAR(20),
    "emergency_services" BOOLEAN DEFAULT false,
    "operating_hours" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("clinic_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "veterinarians_license_number_key" ON "veterinarians"("license_number");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "veterinarians"("vet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "educational_content" ADD CONSTRAINT "educational_content_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "health_monitoring" ADD CONSTRAINT "health_monitoring_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "veterinarians"("vet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("medication_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "veterinarians"("vet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "veterinarians"("vet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("pet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_veterinarians" ADD CONSTRAINT "clinic_veterinarians_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("clinic_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_veterinarians" ADD CONSTRAINT "clinic_veterinarians_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "veterinarians"("vet_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
