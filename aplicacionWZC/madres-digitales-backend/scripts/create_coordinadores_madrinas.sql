CREATE TABLE IF NOT EXISTS public.coordinadores_madrinas (
  id text PRIMARY KEY,
  coordinador_id text NOT NULL,
  madrina_id text NOT NULL,
  fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coordinador FOREIGN KEY (coordinador_id) REFERENCES public.usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_madrina FOREIGN KEY (madrina_id) REFERENCES public.usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_coord_madr UNIQUE (coordinador_id, madrina_id)
);