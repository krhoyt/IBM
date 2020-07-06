/**
 * @file    ZX_Sensor.h
 * @brief   Library for the SparkFun/GestureSense ZX Sensor
 * @author  Shawn Hymel (SparkFun Electronics)
 *
 * @copyright	This code is public domain but you buy me a beer if you use
 * this and we meet someday (Beerware license).
 *
 * This library interfaces the XYZ Interactive ZX Sensor to Arduino over I2C.
 * The library relies on the Arduino Wire (I2C) library. To use the library,
 * instantiate a ZX_Sensor object, call init(), and call the desired
 * functions.
 */

#ifndef ZX_SENSOR_H
#define ZX_SENSOR_H

/* Debug */
#define DEBUG               0

/* Acceptable ZX Sensor version */
#define ZX_MODEL_VER        0x01

/* Acceptable ZX Sensor register map */
#define ZX_REG_MAP_VER      0x01

/* ZX Sensor register addresses */
#define ZX_STATUS           0x00
#define ZX_DRE              0x01
#define ZX_DRCFG            0x02
#define ZX_GESTURE          0x04
#define ZX_GSPEED           0x05
#define ZX_DCM              0x06
#define ZX_XPOS             0x08
#define ZX_ZPOS             0x0A
#define ZX_LRNG             0x0C
#define ZX_RRNG             0x0E
#define ZX_REGVER           0xFE
#define ZX_MODEL            0xFF

/* ZX Sensor bit names */
#define DRE_RNG             0
#define DRE_CRD             1
#define DRE_SWP             2
#define DRE_HOVER           3
#define DRE_HVG             4
#define DRE_EDGE            5
#define DRCFG_POLARITY      0
#define DRCFG_EDGE          1
#define DRCFG_FORCE         6
#define DRCFG_EN            7

/* ZX Sensor UART message headers */
#define ZX_UART_END         0xFF
#define ZX_UART_RANGES      0xFE
#define ZX_UART_X           0xFA
#define ZX_UART_Z           0xFB
#define ZX_UART_GESTURE     0xFC
#define ZX_UART_ID          0xF1

/* Constants */
#define ZX_ERROR            0xFF
#define MAX_X               240
#define MAX_Z               240
#define SET_ALL_DRE         0b00111111

/* Enumeration for possible gestures */
typedef enum GestureType {
    RIGHT_SWIPE = 0x01,
    LEFT_SWIPE = 0x02,
    UP_SWIPE = 0x03,
    NO_GESTURE = 0xFF
} GestureType;

/* Enumeration for possible interrupt enables */
typedef enum InterruptType {
    NO_INTERRUPTS = 0x00,
    POSITION_INTERRUPTS = 0x01,
    GESTURE_INTERRUPTS = 0x02,
    ALL_INTERRUPTS = 0x03
} InterruptType;

/* ZX Sensor Class */
class ZX_Sensor {
public:

    /* Initialization */
    ZX_Sensor(int address);
    ~ZX_Sensor();
    bool init(InterruptType interrupts = NO_INTERRUPTS,
                bool active_high = true);
    uint8_t getModelVersion();
    uint8_t getRegMapVersion();

    /* Interrupt configuration */
    bool setInterruptTrigger(InterruptType interrupts);
    bool configureInterrupts(bool active_high, bool pin_pulse = false);
    bool enableInterrupts();
    bool disableInterrupts();
    bool clearInterrupt();

    /* Data available */
    bool positionAvailable();
    bool gestureAvailable();

    /* Sensor data read */
    uint8_t readX();
    uint8_t readZ();
    GestureType readGesture();
    uint8_t readGestureSpeed();

private:

    /* Bit manipulation */
    bool setRegisterBit(uint8_t reg, uint8_t bit);
    bool clearRegisterBit(uint8_t reg, uint8_t bit);

    /* Raw I2C reads and writes */
    bool wireWriteByte(uint8_t val);
    bool wireWriteDataByte(uint8_t reg, uint8_t val);
    bool wireReadDataByte(uint8_t reg, uint8_t &val);

    /* Members */
    int addr_;
};

#endif /* ZX_SENSOR_H */
