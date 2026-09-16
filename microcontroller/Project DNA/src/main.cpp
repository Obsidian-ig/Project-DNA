#include <Arduino.h>
#include <Arduino_GFX_Library.h>
#include <math.h>

Arduino_DataBus *bus = new Arduino_ESP32QSPI(12 /*CS*/, 38 /*SCK*/, 4, 5, 6, 7);
Arduino_CO5300 *panel = new Arduino_CO5300(bus, 39 /*RST*/, 0, 466, 466, 6, 0, 0, 0);
Arduino_Canvas *gfx = new Arduino_Canvas(466, 466, panel, 0, 0, 0);

void setup() {
  Serial.begin(115200);

  if (!gfx->begin()) {          // starts the panel AND allocates the framebuffer
    Serial.println("gfx->begin() failed!");
    while (1) delay(1000);
  }
  panel->setBrightness(200);    // still call brightness on the panel, after begin

  gfx->fillScreen(RGB565_BLACK);
  gfx->fillCircle(233, 233, 120, RGB565_WHITE);
  gfx->fillCircle(233, 233, 60, RGB565_BLACK);
  gfx->flush();
}

void loop() {
  gfx->fillScreen(RGB565_BLACK);
  gfx->fillCircle(233, 233, 120, RGB565_WHITE);
  gfx->fillCircle(233, 233, 60, RGB565_BLACK);
  gfx->flush();
}