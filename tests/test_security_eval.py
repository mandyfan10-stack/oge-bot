import pytest
from playwright.sync_api import Page, expect
import threading
import http.server
import socketserver
import time
import socket

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

PORT = get_free_port()

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def test_evaluate_condition_security():
    # Start server in background for testing
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1) # wait for server to start

    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for the app to initialize
        page.wait_for_selector(".glass-panel")

        # Open course 'c1' (task 15 is in it)
        page.evaluate("window.openCourse('c1')")

        # Wait for the tasks to render and click task 15
        page.wait_for_timeout(500)
        page.evaluate("window.openTask(15)")

        # Wait for task 15 modal to load
        page.wait_for_selector("#t15-code")

        # Inject a malicious script that attempts XSS
        # If eval() or new Function() is present, this will execute
        malicious_code = """использовать Робот
алг
нач
  нц пока не сверху свободно; window.XSS_INJECTED = true; //
    вправо
  кц
кон"""

        # Fill the textarea
        page.fill("#t15-code", malicious_code)

        # Run the algorithm
        page.click("#t15-run-btn")

        # Wait a bit for execution
        page.wait_for_timeout(1000)

        # Check if the XSS was successful
        xss_injected = page.evaluate("window.XSS_INJECTED")

        # Assert that the injection failed (meaning it's secure)
        assert xss_injected is None, "Vulnerability exists! XSS was successfully injected."

        # Check that the error message is shown (since the condition is invalid now)
        error_displayed = page.evaluate("document.getElementById('t15-error').classList.contains('hidden') === false")
        assert error_displayed, "Expected an error message for invalid condition."

        print("Security check passed: XSS payload was not executed.")
        browser.close()
