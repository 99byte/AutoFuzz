#!/usr/bin/env python3
"""
AutoGLM Fuzz测试工作脚本
由Next.js后端调用，执行Fuzz测试任务
"""

import sys
import json
import argparse
import time
from pathlib import Path

try:
    autoglm_path = Path(__file__).parent.parent / "vendor" / "Open-AutoGLM"
    sys.path.insert(0, str(autoglm_path))
    from phone_agent import PhoneAgent
    from phone_agent.model import ModelConfig
    from phone_agent.adb import ADBConnection
except ImportError as e:
    print(
        json.dumps({"type": "error", "message": f"导入AutoGLM失败: {str(e)}"}),
        flush=True,
    )
    sys.exit(1)


def execute_fuzz_task(
    task_id: str,
    target_app: str,
    test_cases: list,
    model_url: str,
    model: str,
    api_key: str,
):
    """
    执行Fuzz测试任务
    """
    print(
        json.dumps(
            {
                "type": "log",
                "message": f"开始执行Fuzz任务: {task_id}",
                "timestamp": time.time(),
            }
        ),
        flush=True,
    )

    try:
        model_config = ModelConfig(
            base_url=model_url, api_key=api_key, model_name=model
        )

        agent = PhoneAgent(model_config=model_config)

        adb = ADBConnection()
        devices = adb.list_devices()
        if not devices:
            raise Exception("未检测到ADB设备")

        device_id = devices[0].device_id
        print(
            json.dumps(
                {
                    "type": "log",
                    "message": f"使用设备: {device_id}",
                    "timestamp": time.time(),
                }
            ),
            flush=True,
        )

        results = []
        for idx, test_case in enumerate(test_cases):
            print(
                json.dumps(
                    {
                        "type": "progress",
                        "current": idx + 1,
                        "total": len(test_cases),
                        "description": test_case.get("description", ""),
                    }
                ),
                flush=True,
            )

            try:
                task_description = test_case.get("description", "")

                result = agent.run(task_description)

                results.append({"index": idx, "success": True, "result": str(result)})

            except Exception as e:
                results.append({"index": idx, "success": False, "error": str(e)})

        print(json.dumps({"type": "complete", "results": results}), flush=True)

    except Exception as e:
        print(
            json.dumps({"type": "error", "message": f"任务执行失败: {str(e)}"}),
            flush=True,
        )
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="AutoGLM Fuzz Worker")
    parser.add_argument("--task-id", required=True, help="任务ID")
    parser.add_argument("--target-app", required=True, help="目标应用包名")
    parser.add_argument("--test-cases", required=True, help="测试用例JSON文件")
    parser.add_argument("--model-url", required=True, help="模型API地址")
    parser.add_argument("--model", required=True, help="模型名称")
    parser.add_argument("--api-key", required=True, help="API密钥")

    args = parser.parse_args()

    try:
        with open(args.test_cases, "r") as f:
            test_cases = json.load(f)
    except Exception as e:
        print(
            json.dumps({"type": "error", "message": f"读取测试用例文件失败: {str(e)}"}),
            flush=True,
        )
        sys.exit(1)

    execute_fuzz_task(
        args.task_id,
        args.target_app,
        test_cases,
        args.model_url,
        args.model,
        args.api_key,
    )


if __name__ == "__main__":
    main()
