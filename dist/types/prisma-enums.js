"use strict";
// Enums personalizados para reemplazar los de Prisma que no se generan correctamente
Object.defineProperty(exports, "__esModule", { value: true });
exports.NivelDificultad = exports.CategoriaContenido = exports.TipoContenido = exports.PrioridadNivel = exports.AlertaTipo = void 0;
var AlertaTipo;
(function (AlertaTipo) {
    AlertaTipo["SOS"] = "SOS";
    AlertaTipo["MEDICA"] = "MEDICA";
    AlertaTipo["CONTROL"] = "CONTROL";
    AlertaTipo["RECORDATORIO"] = "RECORDATORIO";
    AlertaTipo["HIPERTENSION"] = "HIPERTENSION";
    AlertaTipo["PREECLAMPSIA"] = "PREECLAMPSIA";
    AlertaTipo["DIABETES"] = "DIABETES";
    AlertaTipo["SANGRADO"] = "SANGRADO";
    AlertaTipo["CONTRACCIONES"] = "CONTRACCIONES";
    AlertaTipo["FALTA_MOVIMIENTO_FETAL"] = "FALTA_MOVIMIENTO_FETAL";
    // Tipos adicionales usados en el código
    AlertaTipo["EMERGENCIA_OBSTETRICA"] = "emergencia_obstetrica";
    AlertaTipo["RIESGO_ALTO"] = "riesgo_alto";
    AlertaTipo["TRABAJO_PARTO"] = "trabajo_parto";
    AlertaTipo["SINTOMA_ALARMA"] = "sintoma_alarma";
})(AlertaTipo || (exports.AlertaTipo = AlertaTipo = {}));
var PrioridadNivel;
(function (PrioridadNivel) {
    PrioridadNivel["BAJA"] = "BAJA";
    PrioridadNivel["MEDIA"] = "MEDIA";
    PrioridadNivel["ALTA"] = "ALTA";
    PrioridadNivel["CRITICA"] = "CRITICA";
    // Valores en minúsculas usados en el código
    PrioridadNivel["baja"] = "baja";
    PrioridadNivel["media"] = "media";
    PrioridadNivel["alta"] = "alta";
    PrioridadNivel["critica"] = "critica";
})(PrioridadNivel || (exports.PrioridadNivel = PrioridadNivel = {}));
var TipoContenido;
(function (TipoContenido) {
    TipoContenido["VIDEO"] = "VIDEO";
    TipoContenido["ARTICULO"] = "ARTICULO";
    TipoContenido["INFOGRAFIA"] = "INFOGRAFIA";
    TipoContenido["PODCAST"] = "PODCAST";
    TipoContenido["EJERCICIO"] = "EJERCICIO";
    TipoContenido["RECETA"] = "RECETA";
})(TipoContenido || (exports.TipoContenido = TipoContenido = {}));
var CategoriaContenido;
(function (CategoriaContenido) {
    CategoriaContenido["NUTRICION"] = "NUTRICION";
    CategoriaContenido["EJERCICIO"] = "EJERCICIO";
    CategoriaContenido["CUIDADOS_PRENATALES"] = "CUIDADOS_PRENATALES";
    CategoriaContenido["PREPARACION_PARTO"] = "PREPARACION_PARTO";
    CategoriaContenido["LACTANCIA"] = "LACTANCIA";
    CategoriaContenido["CUIDADOS_BEBE"] = "CUIDADOS_BEBE";
    CategoriaContenido["SALUD_MENTAL"] = "SALUD_MENTAL";
    CategoriaContenido["EMERGENCIAS"] = "EMERGENCIAS";
})(CategoriaContenido || (exports.CategoriaContenido = CategoriaContenido = {}));
var NivelDificultad;
(function (NivelDificultad) {
    NivelDificultad["BASICO"] = "BASICO";
    NivelDificultad["INTERMEDIO"] = "INTERMEDIO";
    NivelDificultad["AVANZADO"] = "AVANZADO";
})(NivelDificultad || (exports.NivelDificultad = NivelDificultad = {}));
