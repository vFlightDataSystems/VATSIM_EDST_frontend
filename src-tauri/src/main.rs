#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[cfg(target_os = "windows")]
#[tauri::command]
fn set_pointer_position(window: tauri::Window, x: i32, y: i32) {
  let inner_size = window.inner_size().unwrap();
  let outer_size = window.outer_size().unwrap();
  let pos = window.inner_position().unwrap();
  unsafe {
    if winapi::um::winuser::SetPhysicalCursorPos(pos.x + x, pos.y + y + (outer_size.height as i32 - inner_size.height as i32)) == 0 {
      panic!("SetCursorPos failed");
    }
  }
}

#[cfg(target_os = "linux")] // TODO: mouse_rs supposedly also works with windows. check this when able.
#[tauri::command]
fn set_pointer_position(window: tauri::Window, x: i32, y: i32) {
  let inner_size = window.inner_size().unwrap();
  let outer_size = window.outer_size().unwrap();
  let pos = window.inner_position().unwrap();
  let mouse = mouse_rs::Mouse::new();
  mouse.move_to(pos.x + x, pos.y + y + (outer_size.height as i32 - inner_size.height as i32)).expect("Unable to move mouse");
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![set_pointer_position])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
