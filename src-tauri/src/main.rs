#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Position::Logical,LogicalPosition};

#[tauri::command]
fn set_cursor_position(window: tauri::Window, x: f64, y: f64) {
  if window.set_cursor_position(Logical(LogicalPosition{x: x, y: y})).is_err() {
    panic!("setting cursor failed");
  }
}

#[tauri::command]
fn set_cursor_grab(window: tauri::Window, value: bool) {
  if window.set_cursor_grab(value).is_err() {
    panic!("grabbing cursor failed");
  }
  if window.set_cursor_visible(true).is_err() {
    panic!("setting cursor visible failed");
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![set_cursor_position, set_cursor_grab])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
