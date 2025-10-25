-- AddForeignKey
ALTER TABLE "zonas_cobertura" ADD CONSTRAINT "zonas_cobertura_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
