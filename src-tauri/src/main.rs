#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Position::Physical,PhysicalPosition};

#[tauri::command]
fn set_pointer_position(window: tauri::Window, x: i32, y: i32) {
    let inner_pos = window.inner_position().unwrap();
    let inner_size = window.inner_size().unwrap();
    let outer_size = window.outer_size().unwrap();
    let result = window.set_cursor_position
        (Physical(PhysicalPosition{x: x + inner_pos.x, y: y + inner_pos.y + (outer_size.height as i32 - inner_size.height as i32)}));
    if result.is_err() {
        panic!("setting cursor failed");
    }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![set_pointer_position])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
