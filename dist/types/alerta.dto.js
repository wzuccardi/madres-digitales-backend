"use strict";
// Tipos para alertas
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrioridadNivel = exports.AlertaTipo = void 0;
var AlertaTipo;
(function (AlertaTipo) {
    AlertaTipo["SOS"] = "sos";
    AlertaTipo["MEDICA"] = "medica";
    AlertaTipo["CONTROL"] = "control";
    AlertaTipo["RECORDATORIO"] = "recordatorio";
    AlertaTipo["HIPERTENSION"] = "hipertension";
    AlertaTipo["PREECLAMPSIA"] = "preeclampsia";
    AlertaTipo["DIABETES"] = "diabetes";
    AlertaTipo["SANGRADO"] = "sangrado";
    AlertaTipo["CONTRACCIONES"] = "contracciones";
    AlertaTipo["FALTA_MOVIMIENTO_FETAL"] = "falta_movimiento_fetal";
})(AlertaTipo || (exports.AlertaTipo = AlertaTipo = {}));
var PrioridadNivel;
(function (PrioridadNivel) {
    PrioridadNivel["BAJA"] = "baja";
    PrioridadNivel["MEDIA"] = "media";
    PrioridadNivel["ALTA"] = "alta";
    PrioridadNivel["CRITICA"] = "critica";
})(PrioridadNivel || (exports.PrioridadNivel = PrioridadNivel = {}));
