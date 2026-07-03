// Data Konten untuk Regional Rooms
import { provincesData } from './provincesData.jsx';

/**
 * Fungsi untuk mengambil data ruangan berdasarkan ID Provinsi.
 * Merender 3 jenis konten: Sejarah (Board), Ikon Arsitektur (Model), dan Bahasa/Sosial (Board)
 */
export function getRegionData(provId) {
  const prov = provincesData.find(p => p.id === provId);
  
  if (prov) {
    return {
      name: prov.name,
      theme: prov.ethnicity,
      artifacts: [
        { 
          id: `prov-${prov.id}-bahasa`, 
          type: 'board', 
          x: -8, 
          z: 0, 
          title: prov.fullContent[1] ? prov.fullContent[1].title : 'Bahasa Daerah',
          subtitle: 'Bahasa & Sosial',
          description: prov.fullContent[1] ? prov.fullContent[1].body : prov.desc
        },
        { 
          id: `prov-${prov.id}-rumah`, 
          type: 'model', 
          modelPath: prov.artifactModel || 'item1.glb',
          x: 0, 
          z: -8, 
          title: prov.exhibits.find(e => e.label === 'Ikon Arsitektur')?.value || 'Ikon Arsitektur',
          subtitle: 'Arsitektur Nusantara',
          description: prov.desc 
        },
        { 
          id: `prov-${prov.id}-sejarah`, 
          type: 'board', 
          x: 8, 
          z: 0, 
          title: prov.fullContent[0] ? prov.fullContent[0].title : 'Sejarah',
          subtitle: 'Sejarah & Akar Kepercayaan',
          description: prov.fullContent[0] ? prov.fullContent[0].body : prov.desc
        }
      ]
    };
  }
  
  // Default Template (Fallback)
  return {
    name: 'Provinsi ' + provId,
    theme: 'Default Earthy',
    artifacts: [
      { id: 'bahasa', type: 'board', x: -8, z: 0, title: 'Bahasa Daerah', subtitle: 'Budaya', description: 'Informasi mengenai bahasa tradisional daerah ini.' },
      { id: 'rumah', type: 'model', x: 0, z: -8, title: 'Ikon Arsitektur', subtitle: 'Arsitektur', description: 'Miniatur ikon arsitektur daerah ini.' },
      { id: 'sejarah', type: 'board', x: 8, z: 0, title: 'Sejarah Provinsi', subtitle: 'Sejarah', description: 'Sejarah singkat pembentukan provinsi ini.' }
    ]
  };
}
