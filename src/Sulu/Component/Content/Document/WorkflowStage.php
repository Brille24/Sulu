<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content\Document;

/**
 * Simple constants class for representing workflow stages.
 *
 * TODO: Workflow should be dynamic
 */
final class WorkflowStage
{
    /**
     * An array containing all the available workflow stages.
     *
     * @var array
     */
    public static $stages = [self::TEST, self::PUBLISHED];

    /**
     * Document is published.
     */
    public const PUBLISHED = 2;

    /**
     * Document is not published.
     */
    public const TEST = 1;
}
