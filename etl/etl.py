from pandas import read_csv

PATH = '../data/'
IN_W = PATH + 'ZONAS_WIFI_GRATIS_PARA_LA_GENTE_-_01_SEPTIEMBRE_2017.csv'
IN_P = PATH + 'Int_Dedicado_Suscri_Dpto_2016_2_T.csv'

puntos_wifi = read_csv(IN_W).rename(
    columns={
        'CÓDIGO DANE DEL DEPARTAMENTO': 'cod_dpto',
        'DEPARTAMENTO': 'dpto',
        'REGION': 'region',
        'AVANCE2010 - 2014': 'puntos_wifi'

    }
)
nombres = (puntos_wifi[['cod_dpto', 'dpto', 'region']]
           .drop_duplicates()
           .set_index('cod_dpto', verify_integrity=True))

penetracion = read_csv(IN_P).rename(columns={'PENETRACION_2015_2T': 'penetracion'})
penetracion['penetracion'] *= 100

puntos_wifi = puntos_wifi.groupby('cod_dpto')['puntos_wifi'].sum().to_frame()
puntos_wifi = puntos_wifi.join(nombres)
puntos_wifi['penetracion'] = penetracion['penetracion'].tolist()

puntos_wifi.fillna(0).to_csv('../data/data.csv')
