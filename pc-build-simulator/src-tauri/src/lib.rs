mod catalog;
mod queue;

use std::collections::HashMap;
use std::sync::Mutex;

use catalog::Category;
use queue::{BuildStatus, Simulator};
use tauri::State;

type Sim<'a> = State<'a, Mutex<Simulator>>;

#[tauri::command]
fn get_catalog(sim: Sim<'_>) -> Vec<Category> {
    sim.lock().unwrap().catalog().to_vec()
}

#[tauri::command]
fn submit_build(sim: Sim<'_>, selection: HashMap<String, String>) -> Result<BuildStatus, String> {
    sim.lock().unwrap().submit(&selection)
}

#[tauri::command]
fn build_status(sim: Sim<'_>, id: u32) -> Result<BuildStatus, String> {
    sim.lock().unwrap().status(id)
}

#[tauri::command]
fn cancel_build(sim: Sim<'_>, id: u32) {
    sim.lock().unwrap().cancel(id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Simulator::new(catalog::load())))
        .invoke_handler(tauri::generate_handler![get_catalog, submit_build, build_status, cancel_build])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o PC Build Simulator");
}
