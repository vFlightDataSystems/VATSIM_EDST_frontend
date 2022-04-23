#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Position::Logical,LogicalPosition};

#[tauri::command]
fn set_cursor_position(window: tauri::Window, x: i32, y: i32) {
  let inner_pos = window.inner_position().unwrap();
  let inner_size = window.inner_size().unwrap();
  let outer_size = window.outer_size().unwrap();
  if window.set_cursor_position
    (Logical(LogicalPosition{x: (x + inner_pos.x) as f64,
                             y: (y + inner_pos.y + (outer_size.height as i32 - inner_size.height as i32)) as f64
    })).is_err() {
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
