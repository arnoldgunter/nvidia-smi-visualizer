// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rand::RngExt;
use nvml_wrapper::{error::NvmlError, Nvml};

#[tauri::command]
fn random_number() -> u32 {
    let mut rng = rand::rng();
    rng.random_range(0..10)
}

fn gpu_info() -> Result<(), NvmlError> {
    let nvml = Nvml::init()?;
    let device = nvml.device_by_index(0)?;
    println!("{:?}", device);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(error) = gpu_info() {
        eprintln!("Unable to read GPU information: {error}");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![random_number])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
