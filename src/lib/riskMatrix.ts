export type RiskBand = 'BIRU' | 'HIJAU' | 'KUNING' | 'MERAH';

export const PROBABILITY = {
  1: { label: 'Sangat Jarang', desc: 'Tdk pernah terjadi ( > 5 thn)' },
  2: { label: 'Jarang', desc: 'Jarang terjadi ( > 2 - 5 thn)' },
  3: { label: 'Mungkin', desc: 'Mungkin terjadi (1 - 2 thn)' },
  4: { label: 'Sering', desc: 'Sering terjadi (Bbrp kali / thn)' },
  5: { label: 'Sangat Sering', desc: 'Terjadi setiap minggu / bulan' }
};

export const IMPACT = {
  1: { label: 'Tidak Signifikan', desc: 'Tidak ada cedera' },
  2: { label: 'Minor', desc: 'Cedera ringan, dpt diatasi dg P3K' },
  3: { label: 'Moderat', desc: 'Cedera sdg, berkurang fungsi motorik / sensorik, LOS bertambah' },
  4: { label: 'Mayor', desc: 'Cedera luas / cacat, khilangan fungsi utama' },
  5: { label: 'Katastropik', desc: 'Kematian yang tidak terduga' }
};

/**
 * Calculates Risk Grading based on standard hospital matrix
 * @param probability 1 to 5
 * @param impact 1 to 5
 * @returns RiskBand (BIRU, HIJAU, KUNING, MERAH)
 */
export function calculateRisk(probability: number, impact: number): RiskBand {
  const score = probability * impact;
  
  if (score >= 15) return 'MERAH';
  if (score >= 9) return 'KUNING';
  if (score >= 5) return 'HIJAU';
  return 'BIRU';
}
