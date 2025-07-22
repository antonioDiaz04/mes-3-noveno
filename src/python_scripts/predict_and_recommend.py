import sys
import json
import joblib
import pandas as pd

# --- Cargar modelos y reglas (rutas ajustadas para estar en la carpeta 'models/') ---
try:
    clf_cargado = joblib.load('models/customer_cluster_classifier.pkl')
    scaler_cargado = joblib.load('models/scaler.pkl')
    rules = joblib.load('models/rules.pkl')
    # Convertir frozensets a listas para que sean serializables a JSON
    rules['antecedents'] = rules['antecedents'].apply(list)
    rules['consequents'] = rules['consequents'].apply(list)
except FileNotFoundError as e:
    print(json.dumps({"error": f"Error: Archivo de modelo o reglas no encontrado. Asegúrate de que customer_cluster_classifier.pkl, scaler.pkl y rules.pkl están en la carpeta 'models/'. Detalle: {e}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": f"Error al cargar modelos o reglas: {str(e)}"}))
    sys.exit(1)

# --- FUNCIONES DE RECOMENDACIÓN (adaptadas para no depender de df_transacciones_con_cluster directamente aquí) ---
# Estas funciones se ejecutan en Python, pero los datos necesarios (como los top productos por cluster)
# ahora deberán ser provistos o inferidos de otra manera si df_transacciones_con_cluster no se pasa.
# Dado que el ejemplo anterior los usaba, asumiré que la "simulación" de estos datos se hará más arriba
# o que la lógica de top_frecuencia/top_monto no se ejecutará aquí.
# Si quieres que Python acceda a datos de transacciones, tendrás que pasarlos desde Node.js.
# Por simplicidad, me centraré en la parte de clustering y reglas de asociación.

def recomendar_por_reglas_asociacion(producto_elegido, rules_df, num_recomendaciones=2):
    """
    Recomienda productos basados en reglas de asociación dado un producto ya elegido.
    Las reglas_df deben tener 'antecedents' y 'consequents' como listas (previamente convertidas de frozensets).
    """
    recomendaciones = set()
    for _, row in rules_df.iterrows():
        # 'antecedents' y 'consequents' ya son listas aquí
        if producto_elegido in row['antecedents']:
            for item in row['consequents']:
                if item != producto_elegido: # Asegurarse de no recomendar el mismo producto
                    recomendaciones.add(item)
                    if len(recomendaciones) >= num_recomendaciones:
                        # Devolver una lista de dicts para incluir confianza
                        results = []
                        for rec_item in list(recomendaciones)[:num_recomendaciones]:
                            confidence = rules_df[
                                (rules_df['antecedents'].apply(lambda x: producto_elegido in x)) &
                                (rules_df['consequents'].apply(lambda x: rec_item in x))
                            ]['confidence'].max() # Usa max() si hay múltiples reglas
                            results.append({"producto": rec_item, "confianza": float(confidence) if not pd.isna(confidence) else None})
                        return results
    
    results = []
    for rec_item in list(recomendaciones):
        confidence = rules_df[
            (rules_df['antecedents'].apply(lambda x: producto_elegido in x)) &
            (rules_df['consequents'].apply(lambda x: rec_item in x))
        ]['confidence'].max()
        results.append({"producto": rec_item, "confianza": float(confidence) if not pd.isna(confidence) else None})
    return results


if __name__ == '__main__':
    try:
        # Leer los datos de entrada desde stdin (enviados desde Node.js)
        input_data = json.loads(sys.stdin.read())
        
        # Datos del cliente actualizados (num_transacciones, monto_total_gastado)
        cliente_data_actualizada = input_data['cliente_data_actualizada']
        # El producto de la nueva transacción para las reglas de asociación
        producto_base_para_reglas = input_data['producto_base_para_reglas']
        # Las recomendaciones por cluster (calculadas en Node.js o pasadas como input si es necesario)
        # Aquí, vamos a asumir que las recomendaciones por cluster se harán en Node.js,
        # o que este script solo retorna el cluster y las reglas de asociación.

        # Convertir a DataFrame para el escalador y el clasificador
        df_cliente_data = pd.DataFrame([cliente_data_actualizada])
        
        # Escalar los datos del cliente
        cliente_scaled = scaler_cargado.transform(df_cliente_data[['num_transacciones', 'monto_total_gastado']])
        cliente_scaled_df = pd.DataFrame(cliente_scaled, columns=['num_transacciones', 'monto_total_gastado'])

        # Predecir el NUEVO Clúster del Cliente
        nuevo_cluster_predicho = clf_cargado.predict(cliente_scaled_df)[0]

        # Generar recomendaciones por Reglas de Asociación
        sugerencias_reglas = recomendar_por_reglas_asociacion(producto_base_para_reglas, rules, num_recomendaciones=3)

        # Preparar la respuesta en formato JSON
        response = {
            "success": True,
            "cluster": int(nuevo_cluster_predicho),
            "sugerencias_reglas": sugerencias_reglas
        }
        print(json.dumps(response))

    except Exception as e:
        print(json.dumps({"error": f"Error en el script Python: {str(e)}"}))
        sys.exit(1)